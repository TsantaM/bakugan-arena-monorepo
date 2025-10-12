// store/animation.ts
import { gsap } from "gsap";
import { create } from "zustand";

type AnimStore = {
    tl: gsap.core.Timeline;
    init: () => void;
    add: (animFn: (tl: gsap.core.Timeline) => void) => void;
    play: () => void;
    reset: () => void;
};

type AnimationInProgressType = {
    animationInProcess: boolean;
    setInProcess: (animation: boolean) => void
};

export const useAninmationInProcess = create<AnimationInProgressType>((set) => ({
    animationInProcess: false,
    setInProcess(animation) {
        set(() => ({ animationInProcess: animation }))
    },
}))

export const useSetGateCardAnimation = create<AnimStore>((set, get) => ({
    tl: gsap.timeline(),
    init: () => {
        const tl = gsap.timeline();
        // tu peux ajouter un callback de fin
        tl.eventCallback("onComplete", () => {
            get().reset();
        });
        set({ tl });
    },
    add: (animFn) => {
        const { tl } = get();
        if (!tl) {
            get().init();
        }
        // on récupère après init
        const timeline = get().tl!;
        animFn(timeline);
    },
    play: () => {
        const { tl } = get();
        tl?.play();
    },
    reset: () => {
        const { tl } = get();
        if (tl) {
            tl.clear();                // supprime les tweens, callbacks, sous-timelines 4
            // réinitialiser les props CSS (effacer les styles inline)
            // ici on peut éventuellement parcourir les éléments animés et faire clearProps
        }
    },
}));

export const useSetBakuganAnimation = create<AnimStore>((set, get) => ({
    tl: gsap.timeline(),
    init: () => {
        const tl = gsap.timeline();
        // tu peux ajouter un callback de fin
        tl.eventCallback("onComplete", () => {
            get().reset();
        });
        set({ tl });
    },
    add: (animFn) => {
        const { tl } = get();
        if (!tl) {
            get().init();
        }
        // on récupère après init
        const timeline = get().tl!;
        animFn(timeline);
    },
    play: () => {
        const { tl } = get();
        tl?.play();
    },
    reset: () => {
        const { tl } = get();
        if (tl) {
            tl.clear();                // supprime les tweens, callbacks, sous-timelines 4
            // réinitialiser les props CSS (effacer les styles inline)
            // ici on peut éventuellement parcourir les éléments animés et faire clearProps
        }
    },
}));

export const useChangePowerLevelAnimation = create<AnimStore>((set, get) => ({
    tl: gsap.timeline(),
    init: () => {
        const tl = gsap.timeline();
        // tu peux ajouter un callback de fin
        tl.eventCallback("onComplete", () => {
            get().reset();
        });
        set({ tl });
    },
    add: (animFn) => {
        const { tl } = get();
        if (!tl) {
            get().init();
        }
        // on récupère après init
        const timeline = get().tl!;
        animFn(timeline);
    },
    play: () => {
        const { tl } = get();
        tl?.play();
    },
    reset: () => {
        const { tl } = get();
        if (tl) {
            tl.clear();                // supprime les tweens, callbacks, sous-timelines 4
            // réinitialiser les props CSS (effacer les styles inline)
            // ici on peut éventuellement parcourir les éléments animés et faire clearProps
        }
    },
}));

export const useGateCardStateChangeAnimation = create<AnimStore>((set, get) => ({
    tl: gsap.timeline(),
    init: () => {
        const tl = gsap.timeline();
        // tu peux ajouter un callback de fin
        tl.eventCallback("onComplete", () => {
            get().reset();
        });
        set({ tl });
    },
    add: (animFn) => {
        const { tl } = get();
        if (!tl) {
            get().init();
        }
        // on récupère après init
        const timeline = get().tl!;
        animFn(timeline);
    },
    play: () => {
        const { tl } = get();
        tl?.play();
    },
    reset: () => {
        const { tl } = get();
        if (tl) {
            tl.clear();                // supprime les tweens, callbacks, sous-timelines 4
            // réinitialiser les props CSS (effacer les styles inline)
            // ici on peut éventuellement parcourir les éléments animés et faire clearProps
        }
    },
}));

export const useGameFinishedAnimation = create<AnimStore>((set, get) => ({
    tl: gsap.timeline(),
    init: () => {
        const tl = gsap.timeline();
        // tu peux ajouter un callback de fin
        tl.eventCallback("onComplete", () => {
            get().reset();
        });
        set({ tl });
    },
    add: (animFn) => {
        const { tl } = get();
        if (!tl) {
            get().init();
        }
        // on récupère après init
        const timeline = get().tl!;
        animFn(timeline);
    },
    play: () => {
        const { tl } = get();
        tl?.play();
    },
    reset: () => {
        const { tl } = get();
        if (tl) {
            tl.clear();                // supprime les tweens, callbacks, sous-timelines 4
            // réinitialiser les props CSS (effacer les styles inline)
            // ici on peut éventuellement parcourir les éléments animés et faire clearProps
        }
    },
}));