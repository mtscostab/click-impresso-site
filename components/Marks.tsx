export function CropMarks() {
  return (
    <span className="crop" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function ColorBar() {
  return (
    <div className="colorbar" aria-hidden="true">
      <span className="reg" />
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} />
      ))}
      <span className="reg" />
    </div>
  );
}

export function Swatches() {
  return (
    <span className="swatches" aria-hidden="true">
      <b className="swatch-c" />
      <b className="swatch-m" />
      <b className="swatch-y" />
      <b className="swatch-k" />
    </span>
  );
}
