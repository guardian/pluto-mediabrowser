interface ItemViewComponentMatches {
    itemId: string,
}

interface LastNComponentMatches {
    pageSize: string;
}

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "*.svg" {
    import React = require("react");
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

interface ProjectComponentMatches {
    projectId: string;
}
