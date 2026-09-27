import "./index.css";
import { Composition, staticFile } from "remotion";
import { GamePromoComponent, GamePromoProps } from "./Composition";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GamePromo"
        component={GamePromoComponent}
        calculateMetadata={async ({ props }) => {
          if (!props.ttsFile) {
            return { durationInFrames: 150 };
          }
          try {
            const duration = await getAudioDurationInSeconds(staticFile(props.ttsFile));
            // Thêm 2 giây ở cuối (60 frames)
            return { durationInFrames: Math.ceil(duration * 30) + 60, props };
          } catch(e) {
            console.error("Audio calculate error:", e);
            return { durationInFrames: 150, props };
          }
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Awesome HTML5 Game",
          thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1080&q=80",
          domain: "arcadegamefree.asia",
          description: "An awesome game description goes here.",
          ttsFile: ""
        } as GamePromoProps}
      />
    </>
  );
};
