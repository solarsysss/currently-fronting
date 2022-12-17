import {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact
} from 'html-react-parser'
import { DateTime, DateTimeFormatOptions } from 'luxon'
import CardSpoiler from '../components/card-spoiler'

const timestampRegex = /<t:(\d{10})(:[tTdDfFR])?>/g

const htmlReactParserOptions: HTMLReactParserOptions = {
  replace: (node: DOMNode) => {
    if (
      node instanceof Element &&
      node.name === 'img' &&
      node.attribs?.class &&
      node.attribs.class.split(' ').includes('d-emoji')
    ) {
      return (
        <img
          className={`${node.attribs.class} max-h-4 inline`}
          src={node.attribs.src}
          alt={node.attribs.alt}
        />
      )
    }
    if (
      node instanceof Element &&
      node.name === 'span' &&
      node.attribs?.class &&
      node.attribs.class.split(' ').includes('d-spoiler')
    ) {
      return (
        <CardSpoiler embed={true} className={node.attribs.class}>
          {domToReact(node.children)}
        </CardSpoiler>
      )
    }
    if (node.type === 'text' && timestampRegex.test((node as Text).data)) {
      const textNodeData = (node as Text).data
      const formattedDateTime = textNodeData.replaceAll(
        timestampRegex,
        (match, p1, p2) => {
          const timestamp = DateTime.fromSeconds(parseInt(p1))
          const format: string = p2 ? p2[1] : 'f'
          if (format !== 'R') {
            const dateTimeFormatOptions = {
              t: { timeStyle: 'short' },
              T: { timeStyle: 'medium' },
              d: { dateStyle: 'short' },
              D: { dateStyle: 'medium' },
              f: { dateStyle: 'medium', timeStyle: 'short' },
              F: { dateStyle: 'full', timeStyle: 'short' }
            }[format]
            return timestamp.toLocaleString(
              dateTimeFormatOptions as DateTimeFormatOptions
            )
          }
          return timestamp.toRelative() as string
        }
      )
      return <span>{formattedDateTime}</span>
    }
  }
}

export { htmlReactParserOptions }
