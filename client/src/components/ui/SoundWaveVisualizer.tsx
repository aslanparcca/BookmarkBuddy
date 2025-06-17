import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface SoundWaveVisualizerProps {
  audioUrl?: string;
  audioFile?: File;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  height?: number;
  showControls?: boolean;
  waveColor?: string;
  progressColor?: string;
}

export default function SoundWaveVisualizer({
  audioUrl,
  audioFile,
  isPlaying = false,
  onPlayPause,
  height = 80,
  showControls = true,
  waveColor = "#8B5CF6",
  progressColor = "#A855F7"
}: SoundWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio context and analyser
  useEffect(() => {
    const initAudio = async () => {
      if (!audioRef.current) return;

      const audio = audioRef.current;
      const ctx = new AudioContext();
      const analyserNode = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audio);
      
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      setAudioContext(ctx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
    };

    if (audioUrl || audioFile) {
      initAudio();
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioUrl, audioFile]);

  // Animation loop for visualizer
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current || !analyser || !dataArray) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, waveColor);
        gradient.addColorStop(1, progressColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying && analyser) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, dataArray, waveColor, progressColor]);

  // Static waveform when not playing
  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static waveform
      const bars = 64;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const barHeight = Math.random() * canvas.height * 0.7 + canvas.height * 0.1;
        
        ctx.fillStyle = `${waveColor}40`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }

      // Progress overlay
      const progressWidth = (currentTime / duration) * canvas.width;
      ctx.fillStyle = `${progressColor}80`;
      ctx.fillRect(0, 0, progressWidth, canvas.height);
    }
  }, [isPlaying, currentTime, duration, waveColor, progressColor]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      onPlayPause?.();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl || (audioFile ? URL.createObjectURL(audioFile) : undefined)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

      {/* Visualizer Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={height}
          className="w-full h-full rounded"
        />

        {/* Floating Info */}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-slate-600">
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center space-x-1"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>CANLI</span>
            </motion.div>
          ) : (
            <span>DURDURULDU</span>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          {/* Main Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="w-10 h-10 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                max={100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
            </div>

            <div className="text-sm text-slate-600 min-w-[80px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="w-8 h-8 p-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>

            <span className="text-xs text-slate-500 min-w-[30px]">
              {Math.round(isMuted ? 0 : volume * 100)}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}