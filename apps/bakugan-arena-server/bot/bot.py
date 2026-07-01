import os
import time
import logging

import socketio

logging.basicConfig(level=logging.INFO, format="[BOT] %(asctime)s %(levelname)s %(message)s")

SERVER_URL = os.getenv("BOT_SERVER_URL", "http://localhost:3005")
BOT_USER_ID = os.getenv("BOT_USER_ID", "bot-alpha")
BOT_DECK_ID = os.getenv("BOT_DECK_ID", "00000000-0000-0000-0000-000000000001")
RANKED = os.getenv("BOT_RANKED", "true").lower() in ["1", "true", "yes"]
SEARCH_DELAY = int(os.getenv("BOT_SEARCH_DELAY", "2"))
RECONNECT_DELAY = int(os.getenv("BOT_RECONNECT_DELAY", "5"))

sio = socketio.Client(reconnection=True, logger=False, engineio_logger=False)

in_game = False
searching = False
room_id = None


def emit_search():
    global searching
    if searching or in_game:
        return
    logging.info("Searching for opponent (ranked=%s)...", RANKED)
    sio.emit("search-opponent", {"userId": BOT_USER_ID, "deckId": BOT_DECK_ID, "ranked": RANKED})
    searching = True


@ sio.event
def connect():
    logging.info("Connected to server %s as %s", SERVER_URL, BOT_USER_ID)
    time.sleep(SEARCH_DELAY)
    emit_search()


@ sio.event
def disconnect():
    global in_game, searching
    logging.warning("Disconnected from server")
    in_game = False
    searching = False


@ sio.on("match-found")
def on_match_found(matched_room_id):
    global in_game, searching, room_id
    logging.info("Match found! room=%s", matched_room_id)
    room_id = matched_room_id
    searching = False
    in_game = True
    sio.emit("init-room-state", {"roomId": room_id, "userId": BOT_USER_ID, "parentSocket": sio.sid, "isSpectator": False})


@ sio.on("game-finished")
def on_game_finished(message):
    global in_game
    logging.info("Game finished: %s", message)
    in_game = False
    time.sleep(SEARCH_DELAY)
    emit_search()


@ sio.on("search-cancelled")
def on_search_cancelled():
    logging.warning("Search cancelled by opponent; retrying in %s seconds", SEARCH_DELAY)
    time.sleep(SEARCH_DELAY)
    emit_search()


@ sio.on("turn-action-request")
def on_turn_action_request(request):
    logging.info("Turn action request: %s", request.get("actions", {}).keys())
    handled = handle_action_request(request)
    if not handled:
        logging.info("No explicit action chosen; asking server to continue turn")
        sio.emit("turn-action", {"roomId": room_id, "userId": BOT_USER_ID})


@ sio.on("gate-card-additional-request")
def on_gate_card_additional_request(request):
    logging.info("Gate card additional request: %s", request)
    resolution = build_gate_card_resolution(request)
    if resolution:
        sio.emit("gate-card-additional-request", resolution)


@ sio.on("ability-additional-request")
def on_ability_additional_request(request):
    logging.info("Ability additional request: %s", request)
    resolution = build_ability_resolution(request)
    if resolution:
        sio.emit("ability-additional-request", resolution)


@ sio.on("init-room-state")
def on_init_room_state(state):
    logging.info("Received initial room state for room %s", room_id)


@ sio.event
def connect_error(data):
    logging.error("Connection failed: %s", data)


@ sio.event
def reconnect():
    logging.info("Reconnected")
    time.sleep(SEARCH_DELAY)
    emit_search()


@ sio.event
def reconnect_error(data):
    logging.error("Reconnect failed: %s", data)
    time.sleep(RECONNECT_DELAY)
    try:
        sio.connect(SERVER_URL, auth={"userId": BOT_USER_ID})
    except Exception as exc:
        logging.exception("Reconnect exception: %s", exc)


@ sio.event
def reconnect_attempt():
    logging.info("Attempting reconnection...")


@ sio.event
def ping():
    logging.debug("ping")


@ sio.on("room-state")
def on_room_state(state):
    logging.debug("Room state received")


@ sio.on("animations")
def on_animations(animations):
    pass


def choose_first_item(items):
    if not items:
        return None
    return items[0]


def handle_action_request(request):
    actions = request.get("actions", {})
    for category in ["mustDo", "mustDoOne", "optional"]:
        for action in actions.get(category, []):
            if handle_action(action):
                return True
    return False


def handle_action(action):
    action_type = action.get("type")
    data = action.get("data")

    if action_type == "SELECT_GATE_CARD":
        choice = choose_first_item(data or [])
        if choice:
            sio.emit("set-gate", {"roomId": room_id, "gateId": choice.get("key"), "slot": None, "userId": BOT_USER_ID})
            return True

    if action_type == "SET_GATE_CARD_ACTION":
        cards = (data or {}).get("cards", [])
        slots = (data or {}).get("slots", [])
        card = choose_first_item(cards)
        slot = choose_first_item(slots)
        if card and slot:
            sio.emit("set-gate", {"roomId": room_id, "gateId": card.get("key"), "slot": slot, "userId": BOT_USER_ID})
            return True

    if action_type == "SET_BAKUGAN":
        bakugans = (data or {}).get("bakugans", [])
        slots = (data or {}).get("setableSlots", [])
        bakugan = choose_first_item(bakugans)
        slot = choose_first_item(slots)
        if bakugan and slot:
            sio.emit("set-bakugan", {"roomId": room_id, "bakuganKey": bakugan.get("key"), "slot": slot, "userId": BOT_USER_ID})
            return True

    if action_type == "OPEN_GATE_CARD":
        gate_id = action.get("gateId")
        slot = action.get("slot")
        if gate_id and slot:
            sio.emit("active-gate-card", {"roomId": room_id, "gateId": gate_id, "slot": slot, "userId": BOT_USER_ID})
            return True

    if action_type == "USE_ABILITY_CARD":
        selection = choose_first_item(data or [])
        if selection:
            ability = choose_first_item(selection.get("abilities", []))
            if ability:
                sio.emit("use-ability-card", {
                    "roomId": room_id,
                    "abilityId": ability.get("key"),
                    "slot": selection.get("slot"),
                    "userId": BOT_USER_ID,
                    "bakuganKey": selection.get("bakuganKey")
                })
                return True

    if action_type == "SELECT_BAKUGAN":
        choice = choose_first_item(data or [])
        if choice:
            sio.emit("set-bakugan", {"roomId": room_id, "bakuganKey": choice.get("key"), "slot": None, "userId": BOT_USER_ID})
            return True

    return False


def build_gate_card_resolution(request):
    data = request.get("data", {})
    resolution = {
        "roomId": request.get("roomId"),
        "userId": request.get("userId"),
        "cardKey": request.get("cardKey"),
        "slot": request.get("slot"),
        "data": {"type": "SKIP_ACTION"}
    }

    if data.get("type") == "SELECT_ABILITY_CARD":
        choice = choose_first_item(data.get("data", []))
        if choice:
            resolution["data"] = {"type": "SELECT_ABILITY_CARD", "cardOwnerId": data.get("cardOwnerId"), "card": choice}
            return resolution

    if data.get("type") == "SELECT_BAKUGAN_TO_SET":
        choice = choose_first_item(data.get("bakugans", []))
        if choice:
            resolution["data"] = {"type": "SELECT_BAKUGAN_TO_SET", "bakugan": choice}
            return resolution

    return resolution


def build_ability_resolution(request):
    data = request.get("data", {})
    resolution = {
        "roomId": request.get("roomId"),
        "userId": request.get("userId"),
        "cardKey": request.get("cardKey"),
        "bakuganKey": request.get("bakuganKey"),
        "slot": request.get("slot"),
        "data": {"type": "SKIP_ACTION"}
    }

    if data.get("type") == "SELECT_SLOT":
        choice = choose_first_item(data.get("slots", []))
        if choice:
            resolution["data"] = {"type": "SELECT_SLOT", "slot": choice}
            return resolution

    if data.get("type") == "SELECT_BAKUGAN_TO_SET":
        choice = choose_first_item(data.get("bakugans", []))
        if choice:
            resolution["data"] = {"type": "SELECT_BAKUGAN_TO_SET", "bakugan": choice}
            return resolution

    if data.get("type") == "MOVE_BAKUGAN_TO_ANOTHER_SLOT":
        bakugan = choose_first_item(data.get("bakugans", []))
        slot = choose_first_item(data.get("slots", []))
        if bakugan and slot:
            resolution["data"] = {"type": "MOVE_BAKUGAN_TO_ANOTHER_SLOT", "bakugan": bakugan, "slot": slot}
            return resolution

    if data.get("type") == "SELECT_BAKUGAN_ON_DOMAIN":
        bakugan = choose_first_item(data.get("bakugans", []))
        slot = request.get("slot")
        if bakugan and slot:
            resolution["data"] = {"type": "SELECT_BAKUGAN_ON_DOMAIN", "bakugan": bakugan.get("key"), "slot": slot, "userId": request.get("userId")}
            return resolution

    if data.get("type") == "ATTRACT_BAKUGAN":
        bakugan = choose_first_item(data.get("bakugans", []))
        if bakugan:
            resolution["data"] = {"type": "ATTRACT_BAKUGAN", "bakugan": bakugan}
            return resolution

    if data.get("type") == "SELECT_ABILITY_CARD":
        card = choose_first_item(data.get("data", []))
        if card:
            resolution["data"] = {"type": "SELECT_ABILITY_CARD", "cardOwnerId": request.get("userId"), "card": card}
            return resolution

    return resolution


if __name__ == "__main__":
    try:
        sio.connect(SERVER_URL, auth={"userId": BOT_USER_ID})
        sio.wait()
    except Exception as error:
        logging.exception("Unable to connect bot: %s", error)
        time.sleep(RECONNECT_DELAY)
        os._exit(1)
