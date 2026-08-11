"use client";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function JsonToHtml({json} : {json: JSONContent}){
    const editor = useEditor({
        extensions: [
          StarterKit,
          TextAlign.configure({
            types: ["heading", "paragraph"],
          }),
          Underline,
          TextStyle, 
          Typography,
          Color.configure({
            types: ['textStyle'],
          }),
          
    
        //   FontFamily.configure({
        //     types: ['textStyle'],
        //   })      
        ],
        immediatelyRender: false,
        editorProps: {
          attributes: {
            class:
              "prose prose-sm sm:prose-sm lg:prose-lg xl:prose-xl dark:prose-invert",
          },
        },
        editable: false,
        content: json,
        
    
        // content: field.value ? JSON.parse(field.value) : "",
      });
      return <EditorContent editor={editor}/>
    
}