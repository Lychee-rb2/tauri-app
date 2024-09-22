import {PropsWithChildren} from "react";

export default function Panel({children}: PropsWithChildren) {
  return <div className="p-6">{children}</div>
}
