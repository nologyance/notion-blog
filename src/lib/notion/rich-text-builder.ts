import { Annotation, Text, RichText, Equation } from "./interfaces"

export function buildRichText(item) {
    const annotation: Annotation = {
      Bold: item.annotations.bold,
      Italic: item.annotations.italic,
      Strikethrough: item.annotations.strikethrough,
      Underline: item.annotations.underline,
      Code: item.annotations.code,
      Color: item.annotations.color,
    }
  
    const richText: RichText = {
      Annotation: annotation,
      PlainText: item.plain_text,
      Href: item.href,
    }
  
    if (item.type === 'text') {
      const text: Text = {
        Content: item.text.content,
        Link: item.text.link,
      }
      richText.Text = text
    } else if (item.type === 'equation') {
      const equation: Equation = {
        Expression: item.equation.expression,
      }
      richText.Equation = equation
    }
  
    return richText
  }
  