export async function loadScripts(urls: string[]): Promise<void> {
    for (const url of urls) {
        if (document.querySelector(`script[data-url="${url}"]`)) continue
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script')
            s.src = url
            s.async = true
            s.dataset.url = url
            s.onload = () => resolve()
            s.onerror = () => reject(new Error(`Failed to load ${url}`))
            document.head.appendChild(s)
        })
    }
};