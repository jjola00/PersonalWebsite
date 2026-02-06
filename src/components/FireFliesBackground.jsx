const FIREFLIES = [
  { top: '12%', left: '8%', duration: '7s', delay: '0s' },
  { top: '45%', left: '92%', duration: '9s', delay: '1.2s' },
  { top: '78%', left: '23%', duration: '6s', delay: '0.5s' },
  { top: '5%', left: '67%', duration: '8s', delay: '2.1s' },
  { top: '91%', left: '45%', duration: '10s', delay: '0.8s' },
  { top: '33%', left: '15%', duration: '7.5s', delay: '3.2s' },
  { top: '62%', left: '78%', duration: '6.5s', delay: '1.8s' },
  { top: '18%', left: '52%', duration: '9.5s', delay: '0.3s' },
  { top: '85%', left: '88%', duration: '8.5s', delay: '2.7s' },
  { top: '50%', left: '35%', duration: '7s', delay: '4.1s' },
  { top: '72%', left: '60%', duration: '5.5s', delay: '1.5s' },
  { top: '25%', left: '42%', duration: '8s', delay: '3.6s' },
  { top: '8%', left: '30%', duration: '9s', delay: '0.9s' },
  { top: '55%', left: '5%', duration: '6s', delay: '2.4s' },
  { top: '40%', left: '72%', duration: '10s', delay: '1.1s' },
];

const FireFliesBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {FIREFLIES.map((firefly, i) => (
        <div
          key={i}
          className={`absolute rounded-full w-[10px] h-[10px] bg-firefly-radial firefly${i >= 8 ? ' hidden sm:block' : ''}`}
          style={{
            top: firefly.top,
            left: firefly.left,
            animation: `move ${firefly.duration} ${firefly.delay} infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

export default FireFliesBackground;
