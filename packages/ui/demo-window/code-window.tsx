import { useEffect, useState } from "react"

import { GenericDemoWindow } from "./generic-window"

export const CodeMarker = ({ children = "" }) => (
  <mark className="bg-transparent text-purple-9 font-normal">{children}</mark>
)

export const sampleLine = [
  [<b>export default function</b>, ` `, <span>IndexPage</span>, "() {"],
  [`  `, <b>return</b>, ` (`],
  [`    <`, <CodeMarker>Container</CodeMarker>, `>`],
  [`      <`, <CodeMarker>Hello World</CodeMarker>, ` />`],
  [`    </`, <CodeMarker>Container</CodeMarker>, `>`],
  [`  )`],
  [`}`]
]

type FileContent = (string | JSX.Element)[]

type FileCodeMap<T extends string> = Record<T, FileContent[]>

export function CodeDemoWindow<T extends Readonly<string>>({
  onFileChange = (_fileName: T) => null,
  fileMap = {} as FileCodeMap<T>,
  className = ""
}) {
  const [activeFile, setActiveFile] = useState<T>()
  const [fileList, setFileList] = useState<T[]>([])

  useEffect(() => {
    const files = Object.keys(fileMap) as T[]
    setActiveFile(files[0])
    setFileList(files)
  }, [fileMap])

  return (
    <GenericDemoWindow
      className={className}
      topBar={
        <>
          {fileList.map((fileName, fIndex) => (
            <button
              key={fileName}
              onClick={() => {
                if (fileName === activeFile) {
                  return
                }
                onFileChange(fileName)
                setActiveFile(fileName)
              }}
              className={`flex items-center px-4 text-xs border-r-2  
              ${fIndex === 0 && "border-l-2"} 
              ${
                activeFile === fileName
                  ? "font-semibold text-mauve-12"
                  : "border-b-2 font-normal text-mauve-9"
              }
            `}>
              {fileName}
            </button>
          ))}
          <div className="flex w-full border-b-2" />
        </>
      }>
      <div className="flex flex-row overflow-auto text-sm md:text-base">
        <div className="flex flex-col px-1 py-2 bg-mauve-4">
          {fileMap[activeFile]?.map((_, i) => (
            <div key={i} className="text-center text-mauve-9 w-10">
              {i + 1}
            </div>
          ))}
          <div className="flex h-full w-full" />
        </div>
        <code className="p-2">
          {fileMap[activeFile]?.map((lineSegmentList, i) => (
            <pre key={i} className="flex">
              {lineSegmentList.map((seg, j) => (
                <span key={`${i}-${j}`}>{seg}</span>
              ))}
            </pre>
          ))}
        </code>
      </div>
    </GenericDemoWindow>
  )
}
