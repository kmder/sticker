let request = params => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(params.method || "GET", params.url);
        if (params.headers) {
            Object.keys(params.headers).forEach(key => {
                xhr.setRequestHeader(key, params.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(params.body);
    });
};