import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Camera, ImageIcon, Loader2 } from 'lucide-react';
import { chatWithSommelier } from '../utils/aiRecommender';
import { useAppContext } from '../context/AppProvider';

const FloatingChat = () => {
  const { inventory } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Olá! Sou o Jean, seu Sommelier pessoal. Você pode me perguntar sobre seus perfumes ou enviar uma foto do seu look para eu recomendar o perfume ideal.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen, isChatting]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && !chatImage) return;
    
    const userMessageText = chatInput.trim() || 'Aqui está a foto.';
    const newMessage = { role: 'user', text: userMessageText, image: chatImage?.preview };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatting(true);

    const aiResponse = await chatWithSommelier(
      inventory,
      chatMessages,
      userMessageText,
      chatImage?.base64,
      chatImage?.mimeType
    );

    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setChatImage(null);
    setIsChatting(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImage({
          preview: reader.result,
          base64: reader.result.split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '85px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9998
        }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '85px',
          right: '20px',
          width: '320px',
          height: '450px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--glass-bg)',
            padding: '1rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--accent)" />
              Consultor IA
            </h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ 
                  background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                  color: msg.role === 'user' ? 'white' : 'var(--text-main)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '16px', 
                  borderBottomRightRadius: msg.role === 'user' ? '0' : '16px', 
                  borderBottomLeftRadius: msg.role === 'model' ? '0' : '16px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {msg.image && <img src={msg.image} alt="Upload" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatting && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomLeftRadius: '0' }}>
                <Loader2 size={20} className="lucide-spin" color="var(--accent)" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end'
          }}>
            <label style={{ padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} color="var(--text-main)" />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
              {chatImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start' }}>
                  <ImageIcon size={14} /> <span style={{ fontSize: '0.7rem' }}>Anexo</span>
                  <button onClick={() => setChatImage(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: '0.5rem' }}>x</button>
                </div>
              )}
              <input 
                type="text" 
                placeholder="Pergunte algo..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()}
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
            <button 
              onClick={handleSendChatMessage}
              disabled={isChatting}
              style={{ background: 'var(--accent)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
