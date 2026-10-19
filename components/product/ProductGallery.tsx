"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CropMarks } from "../Marks";
import { Icon } from "../Icon";

const ZOOM = 2.6;
const LENS = 190;

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lens, setLens] = useState<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });
  const [dragX, setDragX] = useState(0);
  const [canHover, setCanHover] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const n = images.length;

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    const dlg = box.current;
    if (!dlg) return;
    function onKey(e: KeyboardEvent) {
      if (!dlg?.open) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  function onMove(e: React.PointerEvent) {
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      if (Math.abs(dx) > 6) drag.current.moved = true;
      if (n > 1) setDragX(dx);
      return;
    }
    if (!canHover || e.pointerType !== "mouse") return;
    const r = stage.current!.getBoundingClientRect();
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
  }

  function cancelDrag() {
    drag.current = null;
    setDragX(0);
  }

  function onUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    setDragX(0);
    if (!d) return;
    const dx = e.clientX - d.x;
    if (d.moved && Math.abs(dx) > 50 && n > 1) {
      go(index + (dx < 0 ? 1 : -1));
    } else if (!d.moved) {
      box.current?.showModal();
    }
  }

  const rect = stage.current?.getBoundingClientRect();
  const w = rect?.width ?? 1;
  const h = rect?.height ?? 1;

  return (
    <div className="gallery">
      <div className="gallery-frame">
        <CropMarks />
        <div
          className="gallery-stage"
          ref={stage}
          role="region"
          aria-roledescription="galeria"
          aria-label={`Fotos de ${title}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, moved: false };
          }}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={cancelDrag}
          onLostPointerCapture={cancelDrag}
          onPointerLeave={() => {
            setLens((l) => ({ ...l, on: false }));
            if (drag.current) {
              drag.current = null;
              setDragX(0);
            }
          }}
        >
          <div
            className={`gallery-track${dragX ? " dragging" : ""}`}
            style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
          >
            {images.map((src, i) => (
              <div key={src} aria-hidden={i !== index}>
                <img
                  src={src}
                  alt={`${title}, foto ${i + 1} de ${n}`}
                  width={800}
                  height={800}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {canHover && (
            <div
              className={`loupe${lens.on && !drag.current ? " on" : ""}`}
              aria-hidden="true"
              style={{
                left: lens.x,
                top: lens.y,
                backgroundImage: `url("${images[index]}")`,
                backgroundSize: `${w * ZOOM}px ${h * ZOOM}px`,
                backgroundPosition: `${-(lens.x * ZOOM - LENS / 2)}px ${-(lens.y * ZOOM - LENS / 2)}px`,
              }}
            >
              <span className="ticks" />
            </div>
          )}

          <span className="gallery-hint">
            <Icon name="zoom" size={15} /> {canHover ? "Passe o mouse para ampliar" : "Toque para ampliar"}
          </span>
          {n > 1 && (
            <>
              <span className="gallery-count num">
                {index + 1} / {n}
              </span>
              <div className="gallery-arrows">
                <button
                  className="square-btn"
                  aria-label="Foto anterior"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={() => go(index - 1)}
                >
                  <Icon name="arrowLeft" />
                </button>
                <button
                  className="square-btn"
                  aria-label="Próxima foto"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={() => go(index + 1)}
                >
                  <Icon name="arrowRight" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {n > 1 && (
        <div className="thumbs" role="group" aria-label="Miniaturas">
          {images.map((src, i) => (
            <button
              key={src}
              className="thumb"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
            >
              <img src={src} alt="" width={76} height={76} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <button className="gallery-open btn btn-ghost" onClick={() => box.current?.showModal()}>
        Abrir fotos em tela cheia
      </button>

      <dialog
        ref={box}
        className="lightbox"
        aria-label={`Fotos de ${title}`}
        onClick={(e) => {
          if (e.target === box.current) box.current?.close();
        }}
      >
        <div className="lightbox-head">
          <strong className="num">
            {index + 1} / {n}
          </strong>
          <button className="square-btn" aria-label="Fechar" onClick={() => box.current?.close()} autoFocus>
            <Icon name="close" />
          </button>
        </div>
        <div className="lightbox-body" onClick={(e) => e.target === e.currentTarget && box.current?.close()}>
          <img src={images[index]} alt={`${title}, foto ${index + 1} de ${n}`} width={1100} height={1100} />
        </div>
        {n > 1 && (
          <div className="lightbox-foot">
            <button className="square-btn" aria-label="Foto anterior" onClick={() => go(index - 1)}>
              <Icon name="arrowLeft" />
            </button>
            <button className="square-btn" aria-label="Próxima foto" onClick={() => go(index + 1)}>
              <Icon name="arrowRight" />
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
