import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from "remotion";

export type GamePromoProps = {
  title: string;
  thumbnail: string;
  domain: string;
  description?: string;
  ttsFile?: string;
};

export const GamePromoComponent: React.FC<GamePromoProps> = ({ title, thumbnail, domain, description, ttsFile }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animations
  const scale = spring({ fps, frame, config: { damping: 12 } });
  const titleY = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  // Description reveal animation
  const chars = (description || "").split("");
  
  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", overflow: "hidden", fontFamily: "sans-serif" }}>
      {/* Background Audio */}
      {ttsFile && <Audio src={staticFile(ttsFile)} />}
      
      {/* Blurred Background */}
      <AbsoluteFill>
        <Img src={thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, filter: "blur(20px)" }} />
      </AbsoluteFill>

      {/* Main Content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "80px" }}>
        
        {/* Game Title */}
        <h1 style={{ 
          fontSize: "100px", 
          fontWeight: "900", 
          color: "white", 
          textAlign: "center", 
          textTransform: "uppercase",
          textShadow: "0px 10px 30px rgba(0,0,0,0.8)",
          transform: `translateY(${titleY}px)`,
          marginBottom: "60px"
        }}>
          {title}
        </h1>

        {/* Thumbnail Image */}
        <div style={{ borderRadius: "40px", overflow: "hidden", boxShadow: "0 20px 50px rgba(6, 182, 212, 0.5)", border: "10px solid #22d3ee", marginBottom: "60px" }}>
          <Img src={thumbnail} style={{ width: "800px", height: "800px", objectFit: "cover" }} />
        </div>

        {/* Dynamic Caption / Description */}
        <div style={{ 
          color: "#fde047", 
          fontSize: "65px", 
          fontWeight: "bold",
          textAlign: "center", 
          lineHeight: "1.5",
          minHeight: "220px",
          padding: "0 40px",
          textShadow: "0px 5px 20px rgba(0,0,0,1)"
        }}>
          {chars.map((char, index) => {
            const delay = index * ((durationInFrames - 60) / chars.length); 
            const charOpacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <span key={index} style={{ opacity: charOpacity }}>{char}</span>;
          })}
        </div>

        {/* Call to action - Bounces at the end */}
        <div style={{ 
            marginTop: "40px", 
            backgroundColor: "#ef4444", 
            color: "white", 
            padding: "40px 100px", 
            borderRadius: "100px", 
            fontSize: "80px", 
            fontWeight: "900",
            textTransform: "uppercase",
            boxShadow: "0 10px 40px rgba(239, 68, 68, 0.6)",
            transform: `scale(${interpolate(frame, [durationInFrames - 60, durationInFrames - 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`
        }}>
          PLAY NOW!
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
