// Example of using AbortController for API requests and event handlers

import renderHtmlInParent from './component-renderer';

class PostsComponent {
  requestsTimeout = 10000;

  createComponentUnmountAbortController() {
    /* Create an AbortController to cancel fetch requests and event
      listeners when unmounting the component. */
    this.unountAbortController = new AbortController();
    this.unmountSignal = this.unountAbortController.signal;
  }

  createUserAbortRequestController() {
    /* Create an AbortController to cancel fetch requests when the user
      clicks the cancel button. */
    this.userAbortRequestController = new AbortController();

    /* Abort the HTTP request either when unmounting the component,
      or when the user clicks the cancel button, or after 10 seconds. */
    this.requestAbortSignal = AbortSignal.any([
      this.unmountSignal,
      this.userAbortRequestController.signal,
      AbortSignal.timeout(this.requestsTimeout),
    ]);
  }

  createAbortControllers() {
    this.createComponentUnmountAbortController();
    this.createUserAbortRequestController();
  }

  // Fetch posts from the API
  async fetchPosts() {
    try {
      const randomPostId = Math.floor(Math.random() * 100);

      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${randomPostId}`,
        {
          signal: this.requestAbortSignal, // Attach the signal to the fetch request
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch request was aborted');
      } else {
        console.error('Error fetching posts:', error.message);
      }

      return null;
    }
  }

  async renderPosts() {
    const postsContainer = document.getElementById('posts-container');

    // Start fetching posts
    const posts = await this.fetchPosts();

    if (posts) {
      postsContainer.innerHTML = JSON.stringify(posts, null, 2);
    }
  }

  cancelGettingPosts() {
    this.userAbortRequestController.abort();

    // Recreate the abort controller and signal so that they are fresh and uncancelled
    this.createUserAbortRequestController();
  }

  onInit() {
    this.createAbortControllers();

    const getPostsButton = document.getElementById('get-posts-button');
    const cancelGetPostsButton = document.getElementById(
      'cancel-get-posts-button'
    );

    /* Attach event listeners with the same component unmount signal
      so they both get detached when the component unmounts. */
    getPostsButton.addEventListener('click', this.renderPosts.bind(this), {
      signal: this.unmountSignal,
    });
    cancelGetPostsButton.addEventListener(
      'click',
      // Bind the method to the component class instance, else "this" will refer to the button element
      this.cancelGettingPosts.bind(this), 
      {
        signal: this.unmountSignal,
      }
    );
  }

  // Mount the component by rendering and initializing it
  mount(parentId) {
    this.render(parentId);
    this.onInit();
  }

  // Unmount the component
  unmount() {
    // Abort all ongoing operations and remove event listeners
    this.unountAbortController.abort();

    const postsComponent = document.getElementById('posts-component');

    if (postsComponent) {
      postsComponent.remove();
    }
  }

  render(parentId) {
    renderHtmlInParent(
      `
        <div id="posts-component" class="posts">
          <h2>Posts</h2>
          <button id="get-posts-button">Get posts</button>
          <button id="cancel-get-posts-button">Cancel getting posts</button>

          <pre id="posts-container" class="posts-container"></pre>
        </div>
      `,
      parentId
    );
  }
}

// Example usage
async function main() {
  const mountPostsComponentButton = document.getElementById(
    'mount-posts-component'
  );
  const unmountPostsComponentButton = document.getElementById(
    'unmount-posts-component'
  );
  let isPostsComponentMounted = true;

  // Create and initialize the component
  const component = new PostsComponent();
  component.mount('app');

  mountPostsComponentButton.addEventListener('click', () => {
    if (!isPostsComponentMounted) {
      component.mount('app');
      isPostsComponentMounted = true;
    }
  });

  unmountPostsComponentButton.addEventListener('click', () => {
    if (isPostsComponentMounted) {
      component.unmount();
      isPostsComponentMounted = false;
    }
  });
}

// Run the example
main().catch(console.error);
