export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm text-gray-600">
          Vibecoding with Cursor | Powered by OpenAI GPT | Built with React/Vite/TypeScript/TailwindCSS | Created by JUN.NXP (
          <a 
            href="https://www.nextplatform.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            www.nextplatform.net
          </a>
          {' '}/{' '}
          <a 
            href="mailto:naebon1@gmail.com"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            naebon1@gmail.com
          </a>
          )
        </p>
      </div>
    </footer>
  );
}
