import React from 'react';
import { FaRobot } from 'react-icons/fa';

const Loading = () => {
  return (
    <section className="h-full w-full grid place-content-center">
      <div className="flex items-center justify-center gap-3 text-8xl">
        <FaRobot className="animate-bounce text-gray-400" />
      </div>
      <div className="loader mt-4" />
    </section>
  );
};

export default Loading;
