const GameButton = ({ onClick, disabled, variant = 'primary', children }) => {
  const styles = {
    primary: "button-primary",
    secondary: "button-secondary"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={styles[variant]}
    >
      {children}
    </button>
  );
};

export default GameButton; 