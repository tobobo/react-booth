import 'whatwg-fetch';

export default class ApiAdapter {
  static fetch(...args) {
    return fetch(...args);
  }

  static getJson(url) {
    return this.fetch(url)
      .then(response => response.json());
  }

  static postJson(url, body) {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  static getPhotos() {
    return this.getJson('/api/photos');
  }

  static print(photos) {
    return this.postJson('/api/print', { photos })
      .then(response => response.json());
  }
}
