function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader" />
      <p>{text}</p>
    </div>
  );
}

export default Loader;
