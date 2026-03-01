import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ChatWidget = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null); // Full conversation object
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        loadConversations();

        // Setup Socket for global notifications
        const newSocket = io(SOCKET_URL, { withCredentials: true });
        setSocket(newSocket);

        newSocket.emit('join_user', currentUser.id);

        newSocket.on('new_global_message', ({ conversationId, message }) => {
            // Update the list
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === conversationId);
                if (index === -1) {
                    loadConversations();
                    return prev;
                }

                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    lastMessage: message.type === 'IMAGE' ? '📷 Image' : (message.type === 'LOCATION' ? '📍 Location' : message.text),
                    lastMessageAt: message.createdAt,
                    _count: {
                        ...updated[index]._count,
                        messages: message.senderId !== currentUser.id
                            ? (updated[index]._count.messages + 1)
                            : updated[index]._count.messages
                    }
                };

                // Move to top
                const item = updated.splice(index, 1)[0];
                updated.unshift(item);

                return updated;
            });

            // Update current chat if open
            if (selectedConv?.id === conversationId) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            } else if (message.senderId !== currentUser.id) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Listen for typing status in current room
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

        // Custom event to open from other pages
        const openChatListener = (e) => {
            const { bookingId } = e.detail;
            setIsOpen(true);
            // Find existing conversation or create via API
            chatAPI.getOrCreateConversation(bookingId).then(res => {
                handleSelectChat(res.data.data);
            }).catch(err => console.error("Could not open chat from event", err));
        };
        window.addEventListener('open_chat', openChatListener);

        return () => {
            newSocket.disconnect();
            window.removeEventListener('open_chat', openChatListener);
        };
    }, [isAuthenticated, currentUser, selectedConv?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUser]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const res = await chatAPI.getConversations();
            const data = res.data.data;
            setConversations(data);

            const totalUnread = data.reduce((sum, c) => sum + (c._count?.messages || 0), 0);
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = async (conv) => {
        try {
            setChatLoading(true);
            setSelectedConv(conv);

            // Join socket room
            if (socket) {
                socket.emit('join_conversation', conv.id);
            }

            const msgRes = await chatAPI.getMessages(conv.id);
            setMessages(msgRes.data.data);

            // Update unread count locally
            const unreadForThis = conv._count?.messages || 0;
            setUnreadCount(prev => Math.max(0, prev - unreadForThis));
            setConversations(prev => prev.map(c =>
                c.id === conv.id ? { ...c, _count: { ...c._count, messages: 0 } } : c
            ));
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setChatLoading(false);
        }
    };

    const handleBack = () => {
        if (socket && selectedConv) {
            socket.emit('leave_conversation', selectedConv.id);
        }
        setSelectedConv(null);
        setMessages([]);
        setTypingUser(null);
    };

    const handleSendMessage = async (textToSend = newMessage, type = 'TEXT', fileUrl = null, metadata = null) => {
        const text = typeof textToSend === 'string' ? textToSend : newMessage;
        if (!selectedConv || (type === 'TEXT' && !text.trim())) return;

        try {
            await chatAPI.sendMessage({
                conversationId: selectedConv.id,
                text: type === 'TEXT' ? text : null,
                type,
                fileUrl,
                metadata
            });
            if (type === 'TEXT') setNewMessage('');

            if (socket) {
                socket.emit('stop_typing', { conversationId: selectedConv.id, userId: currentUser.id });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const res = await chatAPI.uploadFile(file);
            const url = res.data.data.url;
            await handleSendMessage(null, 'IMAGE', url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const shareLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            await handleSendMessage(null, 'LOCATION', null, { lat: latitude, lng: longitude });
        }, (error) => {
            console.error('Location error:', error);
            alert('Could not get your location. Please check permissions.');
        });
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (socket && selectedConv) {
            socket.emit('typing', {
                conversationId: selectedConv.id,
                userId: currentUser.id,
                userName: currentUser.name
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop_typing', { conversationId: selectedConv.id, userId: currentUser.id });
            }, 2000);
        }
    };

    const quickReplies = currentUser?.role === 'PROVIDER'
        ? ["I am on the way", "Please send location", "I have arrived"]
        : ["Please bring tools", "I am inside", "Ready for the job?"];

    if (!isAuthenticated || !currentUser) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                {/* Floating Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative group h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${isOpen ? 'bg-gray-800 rotate-90 scale-90' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isOpen ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    )}
                    {!isOpen && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Global Widget Container */}
                {isOpen && (
                    <div className="absolute bottom-20 right-0 w-80 md:w-[400px] h-[550px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-slide-up flex flex-col">

                        {/* Conditional Header */}
                        <div className={`p-5 transition-colors ${selectedConv ? 'bg-white border-b' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}>
                            {selectedConv ? (
                                <div className="flex items-center gap-3">
                                    <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border overflow-hidden">
                                        {(currentUser.role === 'PROVIDER' ? selectedConv.customer : selectedConv.provider).avatar ? (
                                            <img src={currentUser.role === 'PROVIDER' ? selectedConv.customer.avatar : selectedConv.provider.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-blue-600">
                                                {(currentUser.role === 'PROVIDER' ? selectedConv.customer.name : selectedConv.provider.name).charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{currentUser.role === 'PROVIDER' ? selectedConv.customer.name : selectedConv.provider.name}</h4>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active now
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold">Messages</h3>
                                    <p className="text-xs text-blue-100 opacity-80">Connected with your network</p>
                                </>
                            )}
                        </div>

                        {/* List View */}
                        {!selectedConv && (
                            <div className="flex-1 overflow-y-auto bg-white">
                                {loading && conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3"></div>
                                        <p className="text-sm font-medium">Looking for chats...</p>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-20 px-10">
                                        <div className="text-4xl mb-4">💬</div>
                                        <h4 className="font-bold text-gray-800">No chats yet</h4>
                                        <p className="text-xs text-gray-400 mt-2">When you book a service or receive a request, messages will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {conversations.map((conv) => {
                                            const recipient = currentUser.role === 'PROVIDER' ? conv.customer : conv.provider;
                                            const hasUnread = (conv._count?.messages || 0) > 0;
                                            return (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => handleSelectChat(conv)}
                                                    className={`w-full flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors text-left ${hasUnread ? 'bg-blue-50/20' : ''}`}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                                        {recipient.avatar ? <img src={recipient.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-gray-400">{recipient.name.charAt(0)}</span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={`text-sm font-bold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>{recipient.name}</h4>
                                                            <span className="text-[10px] text-gray-400">{conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-2">
                                                            <p className={`text-xs truncate ${hasUnread ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>{conv.lastMessage || 'Start chat...'}</p>
                                                            {hasUnread && <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{conv._count.messages}</span>}
                                                        </div>
                                                        <p className="text-[9px] text-blue-500 font-medium mt-1 uppercase tracking-wider">{conv.booking.serviceName}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Individual Chat View */}
                        {selectedConv && (
                            <div className="flex-1 flex flex-col bg-gray-50/50 overflow-hidden">
                                {/* Messages Container */}
                                <div className="flex-1 overflow-y-auto p-5 pb-2 space-y-4">
                                    {chatLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg, idx) => {
                                                const isMe = msg.senderId === currentUser.id;
                                                return (
                                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                                        <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                                }`}>
                                                                {msg.type === 'TEXT' && msg.text}
                                                                {msg.type === 'IMAGE' && (
                                                                    <img src={msg.fileUrl} alt="attachment" className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition" onClick={() => window.open(msg.fileUrl, '_blank')} />
                                                                )}
                                                                {msg.type === 'LOCATION' && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex items-center gap-2 font-bold mb-1">📍 Shared Location</div>
                                                                        <div className="w-full h-32 rounded-lg bg-gray-200 overflow-hidden relative group">
                                                                            <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${msg.metadata.lat},${msg.metadata.lng}&zoom=15&size=300x150&markers=color:red%7C${msg.metadata.lat},${msg.metadata.lng}&key=AIzaSyB...`} alt="map" className="w-full h-full object-cover" />
                                                                            <button
                                                                                onClick={() => window.open(`https://www.google.com/maps?q=${msg.metadata.lat},${msg.metadata.lng}`, '_blank')}
                                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-[10px] font-bold"
                                                                            >
                                                                                OPEN IN GOOGLE MAPS
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] mt-1 text-gray-400 px-1">
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {isMe && msg.isRead && <span className="ml-1 text-blue-500">✓✓</span>}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {typingUser && (
                                                <div className="flex justify-start items-center gap-2 animate-pulse">
                                                    <div className="bg-white border border-gray-100 px-3 py-1.5 rounded-full rounded-tl-none text-[10px] text-gray-500 font-medium">
                                                        {typingUser} is typing...
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Footer Controls */}
                                <div className="p-4 border-t bg-white">
                                    {/* Tools & Quick Replies */}
                                    <div className="flex gap-2 mb-3 pb-1 overflow-x-auto no-scrollbar">
                                        {/* Share Location Button */}
                                        <button onClick={shareLocation} className="p-2.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition border border-green-100 shadow-sm active:scale-90" title="Share Location">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </button>
                                        {/* Attachment Button */}
                                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition border border-purple-100 shadow-sm active:scale-90" title="Attach Image">
                                            {isUploading ? <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                                        {quickReplies.map((reply, i) => (
                                            <button key={i} onClick={() => handleSendMessage(reply)} className="whitespace-nowrap px-4 py-2 text-[11px] bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-all border border-gray-100 font-semibold active:scale-95">{reply}</button>
                                        ))}
                                    </div>

                                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                                        <input type="text" value={newMessage} onChange={handleTyping} placeholder="Write a message..." className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none" />
                                        <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white h-11 w-11 flex items-center justify-center rounded-2xl transition disabled:opacity-40 shadow-lg active:scale-90">
                                            <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatWidget;
