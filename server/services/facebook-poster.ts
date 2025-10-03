import type { Business, Post } from "@shared/schema";

interface FacebookPagePhotoResponse {
  id: string;
  post_id: string;
}

interface FacebookPostResponse {
  id: string;
}

export class FacebookPoster {
  private readonly graphApiUrl = "https://graph.facebook.com/v18.0";

  async uploadPhotoToPage(
    pageId: string,
    accessToken: string,
    imageUrl: string,
    caption: string
  ): Promise<FacebookPagePhotoResponse> {
    const url = `${this.graphApiUrl}/${pageId}/photos`;

    const params = new URLSearchParams({
      url: imageUrl,
      caption: caption,
      access_token: accessToken,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async createPost(
    pageId: string,
    accessToken: string,
    message: string,
    link?: string
  ): Promise<FacebookPostResponse> {
    const url = `${this.graphApiUrl}/${pageId}/feed`;

    const params = new URLSearchParams({
      message: message,
      access_token: accessToken,
    });

    if (link) {
      params.append("link", link);
    }

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async postToFacebook(
    business: Business,
    post: Post
  ): Promise<{ facebookPostId: string }> {
    if (!business.facebookPageId) {
      throw new Error("Facebook Page ID not configured");
    }

    if (!business.facebookAccessToken) {
      throw new Error("Facebook access token not configured");
    }

    try {
      let facebookPostId: string;

      if (post.imageUrl) {
        const photoResponse = await this.uploadPhotoToPage(
          business.facebookPageId,
          business.facebookAccessToken,
          post.imageUrl,
          post.content
        );
        facebookPostId = photoResponse.post_id;
      } else {
        const postResponse = await this.createPost(
          business.facebookPageId,
          business.facebookAccessToken,
          post.content
        );
        facebookPostId = postResponse.id;
      }

      return { facebookPostId };
    } catch (error) {
      console.error("Error posting to Facebook:", error);
      throw error;
    }
  }

  async validatePageAccess(
    pageId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const url = `${this.graphApiUrl}/${pageId}`;
      const params = new URLSearchParams({
        fields: "id,name,access_token",
        access_token: accessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      return response.ok;
    } catch (error) {
      console.error("Error validating Facebook page access:", error);
      return false;
    }
  }
}

export const facebookPoster = new FacebookPoster();
