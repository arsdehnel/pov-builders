import type { DocumentProps } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';
import mainStyles from '@/styles/main.css?url';

const DefaultDocument: React.FC<DocumentProps<RequestInfo>> = ({ children }: DocumentProps<RequestInfo>) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Stance Build</title>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			<link
				href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
				rel="stylesheet"
			/>
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
