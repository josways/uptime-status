function Link(props) {
  const { text, to } = props;
  return (
    <a href={to} target='_blank' rel='noopener noreferrer'>
      {text}
    </a>
  );
}
export default Link;