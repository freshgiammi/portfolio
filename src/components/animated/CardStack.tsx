import React, { useRef } from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import Image, { StaticImageData } from 'next/future/image';

interface CardStackProps extends HTMLMotionProps<'ul'> {
  cardImages: StaticImageData[];
}

const CardStack = ({ cardImages }: CardStackProps) => {
  const constraintsRef = useRef(null);
  const [cards, setCards] = React.useState(cardImages);

  const moveToEnd = (from: number) => {
    const newCards = [...cards];
    newCards.push(cards[from]);
    newCards.shift();
    setCards(newCards);
  };

  return (
    <motion.ul
      className='h-[300px] md:h-[400px]'
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
      ref={constraintsRef}
    >
      {cards.map((card, index) => {
        const canDrag = index === 0;

        return (
          <motion.li
            key={card.src}
            style={{
              position: 'absolute',
              transformOrigin: 'top center',
              listStyle: 'none',
              cursor: canDrag ? 'grab' : 'auto',
            }}
            animate={{
              top: index * -15,
              scale: 1 - index * 0.05,
              zIndex: cards.length - index,
            }}
            drag={canDrag ? 'y' : false}
            dragConstraints={constraintsRef}
            dragSnapToOrigin={true}
            onDragEnd={() => moveToEnd(index)}
          >
            <Image
              alt='p.alt'
              src={card}
              sizes='100vw'
              placeholder='blur'
              draggable={false}
              className='img-squareshadow h-[300px] rounded-md 
              object-cover object-[15%_50%] md:h-[400px]'
            />
          </motion.li>
        );
      })}
    </motion.ul>
  );
};

export default CardStack;
