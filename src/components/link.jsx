function Link(props) {
  const { children, to, ...rest } = props;

  return (
    <a href={to} target='_blank' rel='noopener noreferrer' {...rest}>
      {children}
    </a>
  );
}

export default Link;
