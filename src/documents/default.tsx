import type { DocumentProps } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';
import mainStyles from '@/styles/main.css?url';

const DefaultDocument: React.FC<DocumentProps<RequestInfo>> = ({ children }: DocumentProps<RequestInfo>) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Stance Build</title>
			<link rel="stylesheet" href={mainStyles} />
			<link rel="modulepreload" href="/src/client.tsx" />
		</head>
		<body>
			{children}
			<script>import("/src/client.tsx")</script>
		</body>
	</html>
);

export default DefaultDocument;
