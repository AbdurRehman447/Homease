import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ChatModal = ({ isOpen, onClose, bookingId, recipientName, recipientAvatar }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Quick reply templates
    const quickReplies = currentUser?.role === 'PROVIDER'
        ? ["I am on the way", "Please send location", "I have arrived", "I'm outside"]
        : ["Please bring your own tools", "I am at the location", "Is the price inclusive of parts?"];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && bookingId) {
            loadConversation();
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isOpen, bookingId]);

    useEffect(scrollToBottom, [messages]);

    const loadConversation = async () => {
        try {
            setLoading(true);
            const convRes = await chatAPI.getOrCreateConversation(bookingId);
            const conv = convRes.data.data;
            setConversation(conv);

            const msgRes = await chatAPI.getMessages(conv.id);
            setMessages(msgRes.data.data);

            // Initialize Socket connection
            const newSocket = io(SOCKET_URL, {
                withCredentials: true,
            });

            // Join the private room for this conversation
            newSocket.emit('join_conversation', conv.id);

            // Listen for new messages
            newSocket.on('new_message', (message) => {
                setMessages(prev => {
                    // Avoid duplicate messages if already in state
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            });

            // Listen for typing status
            newSocket.on('user_typing', ({ userId, userName }) => {
                if (userId !== currentUser.id) {
                    setTypingUser(userName);
                }
            });

            newSocket.on('user_stop_typing', ({ userId }) => {
                if (userId !== currentUser.id) {
                    setTypingUser(null);
                }
            });

            setSocket(newSocket);
        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (textToSend = newMessage) => {
        const text = typeof textToSend === 'string' ? textToSend : newMessage;
        if (!text.trim() || !conversation) return;

        try {
            await chatAPI.sendMessage(conversation.id, text);
            setNewMessage('');

            if (socket) {
                socket.emit('stop_typing', { conversationId: conversation.id, userId: currentUser.id });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (socket && conversation) {
            // Emit typing event
            socket.emit('typing', {
                conversationId: conversation.id,
                userId: currentUser.id,
                userName: currentUser.name
            });

            // Clear existing timeout
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Set timeout to emit stop_typing
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop_typing', {
                    conversationId: conversation.id,
                    userId: currentUser.id
                });
            }, 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between bg-white bg-gradient-to-r from-blue-50/30 to-white">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                {recipientAvatar ? (
                                    <img src={recipientAvatar} alt={recipientName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-blue-600 font-bold text-lg">{recipientName?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">{recipientName}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                Active now
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 pb-2 space-y-4 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
                            <p className="text-sm text-gray-400 font-medium">Securing connection...</p>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💬</div>
                                    <p className="text-gray-500 font-medium">No messages yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Start chatting with the {currentUser?.role === 'PROVIDER' ? 'customer' : 'provider'} below.</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                        <div className="flex flex-col max-w-[85%]">
                                            <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <span className={`text-[10px] mt-1 text-gray-400 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && msg.isRead && <span className="ml-1 text-blue-500">✓✓</span>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {typingUser && (
                                <div className="flex justify-start items-center gap-2 animate-pulse">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                        {typingUser.charAt(0)}
                                    </div>
                                    <div className="bg-white border border-gray-100 px-3 py-1.5 rounded-full rounded-tl-none text-[10px] text-gray-500 font-medium">
                                        {typingUser} is typing...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-white pt-3">
                    {/* Quick Replies */}
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {quickReplies.map((reply, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSendMessage(reply)}
                                className="whitespace-nowrap px-4 py-2 text-[12px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all border border-blue-100 font-medium active:scale-95"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Message..."
                                className="w-full bg-gray-100 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-12 w-12 flex items-center justify-center rounded-2xl transition disabled:opacity-40 shadow-lg shadow-blue-500/20 active:scale-90"
                        >
                            <svg className="w-5 h-5 rotate-45 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                        Messages are secure and verified for your protection.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
