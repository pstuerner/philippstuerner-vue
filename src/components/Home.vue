<template>
    <!-- <Head title="Home" /> -->
    <Banner />
    <div class="container px-4 px-lg-5">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-md-10 col-lg-8 col-xl-7">
          <!-- Post preview-->
          <div v-for="post in blogPosts" :key="post.slug" class="post-preview">
              <a>
                <h2 class="post-title"><router-link :to="`/posts/${post.slug}`">{{ post.title }}</router-link></h2>
                <h3 class="post-subtitle"><router-link :to="`/posts/${post.slug}`">{{ post.subtitle }}</router-link></h3>
              </a>
            <p class="post-meta" v-html="`${post.description}`"></p>
          </div>
          <hr class="my-4" />
        </div>
      </div>
    </div>
    <!-- <div>
      <h1>Welcome to My Website!</h1>
      <h2>Blog Posts:</h2>
      <ul>
        <li v-for="post in blogPosts" :key="post.id">
          <router-link :to="`/posts/${post.slug}`">{{ post.title }}</router-link>
        </li>
      </ul>
    </div> -->
</template>

<script>
// import Head from './Head.vue';
import Banner from './Banner.vue';

export default {
  data() {
    return {
      blogPosts: [
        {
          slug: 'artwork',
          title: 'An Artwork A Day',
          subtitle: "Combining OpenAI's GPT3.5 and DALL-E to generate art every day.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on May 19, 2023'
        },
        {
          slug: "gai_animals",
          title: "Generative AI — Animals",
          subtitle: "An interactive world map built with D3.js and Vue.js full of Generative AI using Stable Diffusion and ChatGPT.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on April 23, 2023',
        },
        {
          slug: "sinverguenza",
          title: "Sinvergüenza",
          subtitle: "Stock screener built on top of the Yahoo Finance API using Plotly.js, D3.js, and MongoDB.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on Januar 21, 2023',
        },
        {
          slug: "donquijote",
          title: "Don Quijote",
          subtitle: "Telegram based application to practice Spanish vocabulary.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on December 17, 2022',
        },
        {
          slug: "cmcscanner",
          title: "CMC Scanner",
          subtitle: "Small web application to query and compare historical CoinMarketCap snapshots.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on September 11, 2022',
        },
        {
          slug: "don_conjugator",
          title: "Don Conjugator",
          subtitle: "Web application to practice conjugating Spanish verbs.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on September 8, 2022',
        },
        {
          slug: "gradient_descent",
          title: "Gradient Descent",
          subtitle: "Have a deep dive into one of the most important optimization algorithms in machine learning.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on November 5, 2021',
        },
        {
          slug: "linear_models",
          title: "Linear Models",
          subtitle: "In-depth analysis of linear regression and classification models.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on September 20, 2021',
        },
        {
          slug: "confusion_matrix",
          title: "Confusion Matrix",
          subtitle: "Learn what the confusion matrix and its metrics are by interacting with a simple MNIST classifier.",
          description: 'Posted by <a href="about">Philipp Stuerner</a> on July 15, 2021',
        }
      ],
    };
},
  components: {
    // Head,
    Banner
  }
};
</script>