"use client";

import { FileObject } from "imagekit/dist/libs/interfaces";
import { IKImage } from "imagekitio-next";
import { useCallback, useState } from "react";
import { TextOverlay } from "./TextOverlay";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export function CustomizePanel({
  file
}: {
  file: Pick<FileObject, "filePath" | "name" | "fileId">;

}) {
  const [textTransformation, setTextTransformations] = useState<
    Record<string, { raw: string }>
  >({});
  const [numberOfOverlays, setNumberOfOverlays] = useState(1);
  const [blur, setBlur] = useState(false);
  const [sharpen, setSharpen] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  const textTransformationsArray = Object.values(textTransformation);

  const onUpdate = useCallback(
      debounce(
    (index: number, text: string, fontSize: number, x: number, y: number, bgColor?: string) => {
      setTextTransformations((current) => ({
        ...current,
        [`text${index}`]: {
          raw: `l-text,i-${text ?? " "},${
            bgColor ? `bg-${bgColor},pa-10,` : ""
          }fs-${fontSize},ly-bw_mul_${y.toFixed(2)},lx-bw_mul_${x.toFixed(2)},l-end`,
        },
      }));
    },
    250
  ),
  []
);


  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Customize</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={async() => {
                const image=document.querySelector("#meme img")
                const src=image?.getAttribute("src")
                if(!src) return
                const imageBlob = await fetch(src).then(r => r.blob())
                const imageUrl=URL.createObjectURL(imageBlob)
                const a=document.createElement("a")
                a.href=imageUrl
                a.download=file.name
                a.click()
              }}>
            <Download className="size-8" size={"icon"}/>
                 </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download Image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <Checkbox
                      checked={blur}
                      onCheckedChange={(v) => {
                        setBlur(v as boolean);
                      }}
                      id="blur"
                    />
                    <label
                      htmlFor="blur"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Blur
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Checkbox
                      checked={sharpen}
                      onCheckedChange={(v) => {
                        setSharpen(v as boolean);
                      }}
                      id="sharpen"
                    />
                    <label
                      htmlFor="sharpen"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Sharpen
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Checkbox
                      checked={grayscale}
                      onCheckedChange={(v) => {
                        setGrayscale(v as boolean);
                      }}
                      id="grayscale"
                    />
                    <label
                      htmlFor="grayscale"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Grayscale
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {new Array(numberOfOverlays).fill("").map((_, index) => (
            <TextOverlay key={index} index={index + 1} onUpdate={onUpdate} />
          ))}

          <div className="flex gap-4">
            <Button onClick={() => setNumberOfOverlays(numberOfOverlays + 1)}>
              Add Another Overlay
            </Button>

            {numberOfOverlays > 1 && (
              <Button
                variant={"destructive"}
                disabled={numberOfOverlays === 1}
                onClick={() => {
                  setNumberOfOverlays(numberOfOverlays - 1);
                  const lastIndex = numberOfOverlays;
                  setTextTransformations((cur) => {
                    const newCur = { ...cur };
                    delete newCur[`text${lastIndex}`];
                    return newCur;
                  });
                }}
              >
                Remove Last
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div id="meme">
            <IKImage
              path={file.filePath}
              alt={file.name}
              transformation={
                [
                  blur ? { raw: "bl-3" } : undefined,
                  sharpen ? { raw: "e-sharpen-10" } : undefined,
                  grayscale ? { raw: "e-grayscale" } : undefined,
                  ...textTransformationsArray,
                ].filter(Boolean) as any
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
