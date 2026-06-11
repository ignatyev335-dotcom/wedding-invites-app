import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import type { ContactItem } from '../types';

interface ContactsBlockProps {
  contacts: ContactItem[];
}

function ContactCard({ contact, index }: { contact: ContactItem; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-rose-100"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
        <span className="text-rose-600 font-semibold text-sm">
          {contact.name.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{contact.name}</p>
        {contact.role && <p className="text-xs text-gray-500">{contact.role}</p>}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {contact.phone && (
          <motion.a
            href={`tel:${contact.phone}`}
            className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Phone className="w-4 h-4 text-green-600" />
          </motion.a>
        )}
        {contact.telegram && (
          <motion.a
            href={`https://t.me/${contact.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

export default function ContactsBlock({ contacts }: ContactsBlockProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-6">
        {t('contacts.title')}
      </h3>

      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <ContactCard key={index} contact={contact} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
