import React from 'react';
import { Widget } from '@typeform/embed-react';

interface TypeformEmbedProps {
  id: string;
  height?: string;
}

const TypeformEmbed: React.FC<TypeformEmbedProps> = ({ id, height = '500px' }) => {
  return (
    <Widget
      id={id}
      style={{ width: '100%', height: '100%' }}
      className=""
    />
  );
};

export default TypeformEmbed;