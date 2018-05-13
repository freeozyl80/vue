<template>
    <div v-bind:style="{ width: '800px', height: '400px', backgroundColor: color}">
      <div v-on:click="test(1)"><text>click<text></div>
      <sub></sub>
      <text style="backgroundColor: #3d3d3d">{{string}}</text>
      <div v-for="item in list">
        <text>{{ item.txt }}</text>
      </div>
    </div>
</template>

<script>
  module.exports = {
    methods: {
      test: function() {
        this.string = "Just Qzone Test"
      }
    },
    data() {
      return {
        color: '#DC143C',
        string: 'Congraulation',
        list: [{
          'txt': '这里是for循环第一位'
        }, {
          'txt': '这里是for循环第二位'
        }]
      }
    },
    components: COMPONENTS
  }
</script>
