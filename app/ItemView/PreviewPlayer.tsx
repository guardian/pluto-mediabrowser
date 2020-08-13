import React, {useState, useEffect} from "react";
import {Paper} from "@material-ui/core";

interface PreviewPlayerProps {
    proxyUri: string,
    mediaType: string,
}

const PreviewPlayer:React.FC<PreviewPlayerProps> = (props) => {
    const playerForMediaType = ()=> {
        if(props.mediaType.startsWith("video")) {
            return <video className="media-player video-player" src={props.proxyUri}/>
        } else if(props.mediaType.startsWith("audio")) {
            return <audio className="media-player audio-player" src={props.proxyUri}/>
        } else if(props.mediaType.startsWith("image")) {
            return <Paper elevation={5}><img className="media-player image-view" src={props.proxyUri} alt="Image preview"/></Paper>
        }
    }

    return (
        <div className="player-container">{playerForMediaType()}</div>
    )
}

export default PreviewPlayer;