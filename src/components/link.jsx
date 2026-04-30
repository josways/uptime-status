function Link(props) {
  const { text, to, ...rest } = props;
   return (
    <a href={to} target='_blank' rel='noopener noreferrer' {...rest}>
       {text}
     </a>
   );
 }
export default Link;
