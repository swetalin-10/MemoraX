import React from 'react'
import { FileText, Plus } from 'lucide-react'
import Button from './Button'

const EmptyState = ({ onActionClick, title, description, buttonText, icon: CustomIcon }) => {
  const Icon = CustomIcon || FileText;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 mb-6">
        <Icon className="w-7 h-7 text-neutral-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 mb-8 max-w-sm leading-relaxed">{description}</p>
      {buttonText && onActionClick && (
        <Button
          onClick={onActionClick}
          icon={<Plus className="w-4 h-4" strokeWidth={2.5} />}
        >
          {buttonText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState