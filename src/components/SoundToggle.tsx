"use client";

import { useEffect, useRef, useState } from "react";

/** Optional room tone, built live with Web Audio. Always starts off. */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const audio = useRef<{ context: AudioContext; gain: GainNode } | null>(null);

  useEffect(
    () => () => {
      void audio.current?.context.close();
    },
    [],
  );

  const toggle = () => {
    audio.current ??= createRoomTone();
    const { context, gain } = audio.current;
    void context.resume();
    gain.gain.setTargetAtTime(on ? 0 : 0.05, context.currentTime, 0.5);
    setOn(!on);
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={on} className={`label sweep hover:text-paper ${className ?? ""}`}>
      Sound {on ? "On" : "Off"}
    </button>
  );
}

function createRoomTone() {
  const context = new AudioContext();
  const seconds = 4;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  return { context, gain };
}
