import React, {useState, useEffect} from "react";
import {VidispineShape} from "../vidispine/shape/VidispineShape";
import {Grid, Typography} from "@material-ui/core";
import PreviewPlayer from "./PreviewPlayer";
import ShapeSelector from "./ShapeSelector";
import axios from "axios";

interface PlayerContainerProps {
    shapes: VidispineShape[];
    uriList: string[];
    defaultShapes: string[];
    vidispineBaseUri: string;
}

const PlayerContainer:React.FC<PlayerContainerProps> = (props) => {
    /**
     * checks to see if any of the shapes we have been given have tags that match the ones that are our "defaults".
     * if so, return the first matching tag. this is used as the default value for the shapetag selector.
     */
    const findInitialShapetag = ()=>{
        const shapeMatches = props.shapes
            .filter((shape)=>shape.tag.length>0)
            .filter((shape)=>props.defaultShapes.includes(shape.tag[0]))
        return shapeMatches.length > 0 ? shapeMatches[0].tag[0] : "";
    }

    const [selectedShapeTag, setSelectedShapeTag] = useState<string>(findInitialShapetag());
    //const [selectedShape, setSelectedShape] = useState<VidispineShape|null>(null);
    const [playerUri, setPlayerUri] = useState<string>("");
    const [mimeType, setMimeType] = useState<string>("");

    // /**
    //  * when the selected shape tag changes, update the player url
    //  */
    // useEffect(()=>{
    //     const currentShapeData = findSelectedShape();
    //     setSelectedShape(currentShapeData);
    //     //const targetUri = currentShapeData ? currentShapeData.getDefaultUri("http") : undefined;
    //     // const authedUri = currentShapeData &&
    //     //                     currentShapeData.containerComponent &&
    //     //                     currentShapeData.containerComponent.file ?
    //     //                         `${props.vidispineBaseUri}/API/storage/file/${currentShapeData.containerComponent.file[0].id}/uri` : undefined;
    //     const authedUri = `${props.vidispineBaseUri}/API/item/${props.itemId}`
    //     if (authedUri) {
    //         axios.post(authedUri,null,{headers:{"Accept": "application/json"}}).then((response)=>{
    //             console.log(response.data);
    //             if(response.data.uri && response.data.uri.length>0) {
    //                 setPlayerUri(response.data.uri[0]);
    //             } else {
    //                 console.log("No uris returned for playback!")
    //                 setPlayerUri("");
    //             }
    //         }).catch((err)=>{
    //             console.error("Could not get playback url: ", err);
    //         })
    //     }
    //
    // }, [selectedShapeTag]);

    /**
     * try to locate the file ID assocaited with the given shape
     * @param currentShapeData
     */
    const getFileId = (currentShapeData:VidispineShape) => {
        if(currentShapeData.mimeType.length>0) {
            setMimeType(currentShapeData.mimeType[0])
        }
        if(currentShapeData.containerComponent) {
            return currentShapeData.containerComponent.file && currentShapeData.containerComponent.file.length>0 ? currentShapeData.containerComponent.file[0].id : undefined;
        }
        if(currentShapeData.audioComponent) {
            const potentialComponents = currentShapeData.audioComponent.filter(c=>c.file.length>0)
            if(potentialComponents.length>0) {
                return potentialComponents[0].file[0].id
            } else {
                return undefined;
            }
        }
        if(currentShapeData.videoComponent) {
            const potentialComponents = currentShapeData.videoComponent.filter(c=>c.file.length>0)
            if(potentialComponents.length>0) {
                return potentialComponents[0].file[0].id
            } else {
                return undefined;
            }
        }
        return undefined;
    }

    /**
     * when the selected shape tag changes, update the player url
     */
    useEffect(()=>{
        const currentShapeData = findSelectedShape();
        if(!currentShapeData) return;

        const fileId = getFileId(currentShapeData);
        if(!fileId) return;

        console.log("fileId is ", fileId);

        const matcher = new RegExp(`${fileId}\..*$`);
        //uri.search returns the index in the string of a match, or -1 if there is no match
        const matchingUris = props.uriList.filter(uri=>uri.search(matcher)>0);
        console.log(matchingUris);
        console.debug(`Found ${matchingUris.length} matching URIs`);

        if(matchingUris.length>0) {
            setPlayerUri(matchingUris[0]);
        } else {
            setPlayerUri("");
        }
    }, [selectedShapeTag]);

    /**
     * returns the VidispineShape data structure associated with the shape matching the selected tag
     */
    const findSelectedShape = ()=>{
        if(selectedShapeTag==="") return null;
        for(let i=0;i<props.shapes.length;++i) {
            if(props.shapes[i].tag.includes(selectedShapeTag)) return props.shapes[i];
        }
        return null;
    }


    return (
        <Grid container alignItems="center" justify="center" direction="column">
            <Grid item xs={12} spacing={1}>
                {
                    <PreviewPlayer
                        proxyUri={ playerUri }
                        mediaType={mimeType}
                    />
                }
                {
                    selectedShapeTag=="" ? <Typography variant="caption">There is no shape currently selected</Typography> : null
                }
                {
                    selectedShapeTag!="" && !playerUri ?
                        <Typography variant="caption">Could not find a uri for {mimeType}</Typography> :
                        null
                }
            </Grid>
            <Grid item xs={12}>
                <ShapeSelector options={props.shapes.map(s=>s.tag.length>0 ? s.tag[0] : "")}
                               onSelectionChanged={(newSelection) => setSelectedShapeTag(newSelection)}
                               currentTag={selectedShapeTag}
                />
            </Grid>
        </Grid>
    )
}

export default PlayerContainer;