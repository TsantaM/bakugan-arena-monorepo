export type MessageType = {
    createdAd: number,
    senderName: string,
    senderId: string,
    text: string,
    targetId: string
}

export type SendMessageSocketType = {
    targetId: string;
    message: MessageType;
    username: string;
    senderId: string;
    targetName: string;
}

export type ReceiveMessageSocketType = {
    targetId: string;
    targetName: string;
    message: MessageType;
}