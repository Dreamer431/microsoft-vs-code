import React from 'react';
import { t } from '../utils/i18n';

export type TouchControlCode =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Space'
  | 'KeyR';

interface TouchControlsProps {
  onControlChange: (code: TouchControlCode, pressed: boolean) => void;
}

interface HoldButtonProps {
  code: TouchControlCode;
  label: string;
  ariaLabel: string;
  className?: string;
  onControlChange: TouchControlsProps['onControlChange'];
}

const HoldButton = ({
  code,
  label,
  ariaLabel,
  className = '',
  onControlChange,
}: HoldButtonProps) => {
  const release = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onControlChange(code, false);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`touch-key flex h-11 w-11 items-center justify-center border border-[#5a5a5a] bg-[#252526]/90 text-sm font-bold text-white shadow-lg shadow-black/40 active:border-[#9cdcfe] active:bg-[#094771] ${className}`}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onControlChange(code, true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={() => onControlChange(code, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
};

const TouchControls = ({ onControlChange }: TouchControlsProps) => (
  <div className="pointer-events-none absolute inset-x-2 bottom-8 z-40 flex items-end justify-between md:hidden">
    <div
      className="pointer-events-auto grid grid-cols-3 grid-rows-2 gap-1"
      role="group"
      aria-label={t('touchMove')}
    >
      <HoldButton
        code="ArrowUp"
        label="↑"
        ariaLabel={`${t('touchMove')}: ↑`}
        className="col-start-2"
        onControlChange={onControlChange}
      />
      <HoldButton
        code="ArrowLeft"
        label="←"
        ariaLabel={`${t('touchMove')}: ←`}
        className="col-start-1 row-start-2"
        onControlChange={onControlChange}
      />
      <HoldButton
        code="ArrowDown"
        label="↓"
        ariaLabel={`${t('touchMove')}: ↓`}
        className="col-start-2 row-start-2"
        onControlChange={onControlChange}
      />
      <HoldButton
        code="ArrowRight"
        label="→"
        ariaLabel={`${t('touchMove')}: →`}
        className="col-start-3 row-start-2"
        onControlChange={onControlChange}
      />
    </div>

    <div className="pointer-events-auto flex items-end gap-2">
      <HoldButton
        code="KeyR"
        label="R"
        ariaLabel={t('touchRefactor')}
        className="h-12 w-12 rounded-full border-[#c586c0] text-[#e8c7e8]"
        onControlChange={onControlChange}
      />
      <HoldButton
        code="Space"
        label="</>"
        ariaLabel={t('touchShoot')}
        className="h-16 w-16 rounded-full border-[#007acc] bg-[#094771]/95 text-[#9cdcfe]"
        onControlChange={onControlChange}
      />
    </div>
  </div>
);

export default TouchControls;
