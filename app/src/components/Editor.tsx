import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const AVAILABLE_BLOCKS = [
  { id: 'timer', label: 'Таймер', icon: '\u23F0' },
  { id: 'program', label: 'Программа', icon: '\uD83D\uDCCB' },
  { id: 'dressCode', label: 'Дресс-код', icon: '\uD83D\uDC54' },
  { id: 'transfer', label: 'Трансфер', icon: '\uD83D\uDE97' },
  { id: 'map', label: 'Карта', icon: '\uD83D\uDCCD' },
  { id: 'gifts', label: 'Пожелания', icon: '\uD83C\uDF81' },
  { id: 'contacts', label: 'Контакты', icon: '\uD83D\uDCF1' },
  { id: 'rsvp', label: 'RSVP', icon: '\u2709\uFE0F' },
];

interface SortableBlockProps {
  id: string;
  label: string;
  icon: string;
  index: number;
}

function SortableBlock({ id, label, icon, index }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/80 backdrop-blur-sm border shadow-sm transition-shadow ${
        isDragging
          ? 'border-rose-400 shadow-lg ring-2 ring-rose-200'
          : 'border-rose-100 hover:shadow-md'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Drag Handle */}
      <button
        className="flex-shrink-0 p-1 rounded-md hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-colors cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Icon */}
      <span className="text-xl flex-shrink-0">{icon}</span>

      {/* Label */}
      <span className="flex-1 text-sm sm:text-base font-medium text-gray-700">{label}</span>

      {/* Order number */}
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
    </motion.div>
  );
}

interface EditorProps {
  blockOrder: string[];
  onUpdate: (blocks: string[]) => void;
}

export default function Editor({ blockOrder, onUpdate }: EditorProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState(blockOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        onUpdate(newItems);
        return newItems;
      });
    }
  };

  // Map block IDs to their full data
  const blocksData = items
    .map((id) => AVAILABLE_BLOCKS.find((b) => b.id === id))
    .filter(Boolean) as typeof AVAILABLE_BLOCKS;

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-lg font-bold text-rose-800 mb-2">{t('editor.title')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('editor.dragHint')}</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocksData.map((block, index) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                label={block.label}
                icon={block.icon}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </motion.div>
  );
}
