import axios from 'axios';


async function getHelpieResponse(prompt: string): Promise<string> {
    const apiUrl = "http://localhost:3000"
    
    try {
        const response = await axios.post(apiUrl, {prompt})
        return response.data.bot.trim();
    } catch(error) {
        console.error('Error fetching helpie response:', error);
        return 'Something Went Wrong'
    }
}

export { getHelpieResponse }