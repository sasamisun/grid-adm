// hero.tsに以下をコピー
import { heroui } from "@heroui/react";
export default heroui({
    layout: {
        disabledOpacity: "0.3",
        radius: {
            small: "2px",
            medium: "4px",
            large: "6px",
        },
        borderWidth: {
            small: "1px",
            medium: "1px",
            large: "2px",
        },
    },
});