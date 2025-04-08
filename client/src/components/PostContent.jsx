import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/github.css'; // or any other highlight.js theme

function PostContent({ content }) {
  return (
    <div className="post-content">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              style={{ maxWidth: '100%', borderRadius: '8px', margin: '12px 0' }}
              alt=""
            />
          ),
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#2e8b57' }} />
          ),
          code({ node, inline, className, children, ...props }) {
            return !inline ? (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      />
    </div>
  );
}

export default PostContent;
