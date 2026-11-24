import React from 'react';
import { BookOpen } from 'lucide-react';

export interface CategoryIconProps {
  category?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  size = 20,
  className = '',
}) => {
  return <BookOpen size={size} className={className} />;
};
