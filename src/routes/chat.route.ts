import {
	AddNewMessageController,
	AllChatConversationController,
	AllChatListController,
	AllContactListController,
} from '@/controllers/chat.controller';
import { Router } from 'express';

const chatRoute = Router();

chatRoute.get('/all-chat-list', AllChatListController);
chatRoute.get('/all-contact-list', AllContactListController);
chatRoute.get('/all-conversations/:receiverId', AllChatConversationController);
chatRoute.post('/new-message', AddNewMessageController);

export default chatRoute;
