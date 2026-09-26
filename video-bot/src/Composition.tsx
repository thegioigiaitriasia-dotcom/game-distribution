import { AbsoluteFill, Composition, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type GamePromoProps = {
  title: string;
  thumbnail: string;
};

export const MyComposition = () => {
  return (
    <Composition
      id="GamePromo"
      component={GamePromoComponent}
      durationInFrames={150} // 5 seconds at 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        title: "Awesome HTML5 Game",
        thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1080&q=80"
      }}
    />
  );
};

export const GamePromoComponent: React.FC<GamePromoProps> = ({ title, thumbnail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const scale = spring({ fps, frame, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [10, 30], [50, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", overflow: "hidden", fontFamily: "sans-serif" }}>
      {/* Blurred Background */}
      <AbsoluteFill>
        <Img src={thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, filter: "blur(20px)" }} />
      </AbsoluteFill>

      {/* Main Content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "100px", opacity }}>
        
        {/* Game Title */}
        <h1 style={{ 
          fontSize: "100px", 
          fontWeight: "900", 
          color: "white", 
          textAlign: "center", 
          textTransform: "uppercase",
          textShadow: "0px 10px 30px rgba(0,0,0,0.8)",
          transform: \`translateY(\${titleY}px)\`,
          marginBottom: "80px"
        }}>
          {title}
        </h1>

        {/* Thumbnail Image */}
        <div style={{ transform: \`scale(\${scale})\`, borderRadius: "40px", overflow: "hidden", boxShadow: "0 20px 50px rgba(6, 182, 212, 0.5)", border: "10px solid #22d3ee" }}>
          <Img src={thumbnail} style={{ width: "800px", height: "800px", objectFit: "cover" }} />
        </div>

        {/* Call to action */}
        <div style={{ 
            marginTop: "120px", 
            backgroundColor: "#a855f7", 
            color: "white", 
            padding: "40px 80px", 
            borderRadius: "100px", 
            fontSize: "60px", 
            fontWeight: "bold",
            boxShadow: "0 10px 40px rgba(168, 85, 247, 0.6)"
        }}>
          Play FREE at ArcadeHub.com
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
