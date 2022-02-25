import React from "react";
// @ts-ignore
import CodeMirror from "codemirror/lib/codemirror"; //see https://github.com/codemirror/CodeMirror/issues/5484
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css";
import "codemirror/mode/xml/xml";
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import formatXML from "xml-formatter";

interface CodeMirrorProps {
  value: string;
}

interface CodeMirrorContainerState {
  failureMessage?: string;
  startH: number;
  startY: number;
}

const styles = createStyles({
  dragHandle: {
    background: "#f7f7f7",
    height: "20px",
    userSelect: "none",
    cursor: "row-resize",
    borderTop: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    "&:before": {
      content: "\u2261" /* https://en.wikipedia.org/wiki/Triple_bar */,
      color: "#999",
      position: "absolute",
      left: "50%",
    },
    "&:hover": {
      background: "#f0f0f0",
    },
  },
});

class CodeMirrorContainer extends React.Component<
  CodeMirrorProps & StyledComponentProps,
  CodeMirrorContainerState
> {
  private textAreaRef = React.createRef<HTMLDivElement>();
  private dragHandleRef = React.createRef<HTMLDivElement>();
  private CM_MIN_HEIGHT = 200;

  //textAreaRef:React.Ref<HTMLTextAreaElement>;
  cm?: CodeMirror;

  constructor(props: CodeMirrorProps & StyledComponentProps) {
    super(props);

    this.state = {
      startH: -1,
      startY: -1,
    };

    this.onDragHandler = this.onDragHandler.bind(this);
    this.onDragRelease = this.onDragRelease.bind(this);
    this.startDraggingHandler = this.startDraggingHandler.bind(this);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CodeMirrorContainer failed with the error ", error);
    console.error(errorInfo);
  }

  static getDerivedStateFromError(err: Error) {
    return {
      failureMessage: err.toString,
    };
  }

  /**
   * This callback is only used temporarily. It is inserted by `startDraggingHandler` and removed by `onDragRelease`,
   * so it is only active while the user has a mouse button down over the drag handle.
   * It continuously changes the height of the codemirror instance according to the relative movement of the mouse
   * @param evt MouseEvent provided by the DOM
   */
  onDragHandler(evt: MouseEvent) {
    if (this.cm) {
      const calculatedHeight = this.state.startH + evt.y - this.state.startY;
      const desiredHeight = Math.max(this.CM_MIN_HEIGHT, calculatedHeight);
      this.cm.setSize(null, `${desiredHeight}px`);
    } else {
      console.error("codeMirror not set in state so can't change it");
    }
  }

  onDragRelease(evt: MouseEvent) {
    console.log("drag end");
    document.body.removeEventListener("mousemove", this.onDragHandler);
    window.removeEventListener("mouseup", this.onDragRelease);
  }

  getCMHeight() {
    if (this.textAreaRef.current) {
      const heightString = window
        .getComputedStyle(this.textAreaRef.current)
        .height.replace(/px$/, "");
      return parseInt(heightString);
    } else {
      console.log("No textAreaRef");
      return this.CM_MIN_HEIGHT;
    }
  }
  /**
   * This callback is run when the user pushes a mouse button over the drag handle.
   * We store the co-ords of the start of the drag in order to compute how much to increase/reduce the size by
   * We also register handlers to detect movement within the document, in order to update the size continuously,
   * and another to detect mouse-up anywhere in the window to stop the operation.
   * @param evt MouseEvent provided by the DOM
   */
  startDraggingHandler(evt: MouseEvent) {
    if (this.cm) {
      console.log("drag start");

      this.setState({
        startY: evt.y,
        startH: this.getCMHeight(),
      });

      document.body.addEventListener("mousemove", this.onDragHandler);
      window.addEventListener("mouseup", this.onDragRelease);
    } else {
      console.log("CodeMirror not set in state, so can't resize it");
    }
  }

  componentDidMount() {
    console.log("textAreaRef is ", this.textAreaRef?.current);
    if (this.textAreaRef.current) {
      this.cm = CodeMirror(this.textAreaRef.current, {
        lineNumbers: true,
        mode: "xml",
        readOnly: true,
        nocursor: true,
      });
      this.cm.setValue(this.props.value);
    }

    if (this.dragHandleRef.current) {
      console.log("installing startDraggingHandler");
      this.dragHandleRef.current.addEventListener(
        "mousedown",
        this.startDraggingHandler
      );
    }
  }

  componentWillUnmount() {
    //rely on garbage-collection to free the codemirror object once this object is destroyed
  }

  componentDidUpdate(
    prevProps: Readonly<CodeMirrorProps>,
    prevState: Readonly<CodeMirrorContainerState>,
    snapshot?: any
  ) {
    if (prevProps.value != this.props.value && this.cm) {
      try {
        const formatted = formatXML(this.props.value, {
          indentation: "  ",
          lineSeparator: "\n",
        });
        this.cm.setValue(formatted);
      } catch (err) {
        console.error("Could not reformat XML: ", err);
        this.cm.setValue(this.props.value);
      }
    }
  }

  render() {
    return this.state.failureMessage ? (
      <Alert severity="error">{this.state.failureMessage}</Alert>
    ) : (
      <>
        <div ref={this.textAreaRef} />
        <div
          className={this.props.classes?.dragHandle}
          ref={this.dragHandleRef}
        />
      </>
    );
  }
}

export default withStyles(styles)(CodeMirrorContainer);
