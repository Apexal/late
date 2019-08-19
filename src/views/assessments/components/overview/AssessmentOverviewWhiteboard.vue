<template>
  <div class="assessment-overview-whiteboard">
    <canvas
      id="whiteboard"
      ref="whiteboard"
      :height="700"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseout="onMouseOut"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewWhiteboard',
  props: {
    assessment: { type: Object, required: true }
  },
  data () {
    return {
      drawing: false,
      lastMouseUpdated: null,
      current: {
        x: 0,
        y: 0
      }
    }
  },
  sockets: {
    'assessment whiteboard draw' ({ x0, y0, x1, y1 }) {
      this.drawLine(x0 * this.$refs.whiteboard.width, y0 * this.$refs.whiteboard.height, x1 * this.$refs.whiteboard.width, y1 * this.$refs.whiteboard.height, false)
    }
  },
  computed: {
    context () {
      return this.$refs.whiteboard.getContext('2d')
    },
    rect () {
      return this.$refs.whiteboard.getBoundingClientRect()
    }
  },
  mounted () {
    window.addEventListener('resize', this.onResize, false)
    this.onResize()
  },
  methods: {
    scaleCoords (event) {
      return {
        x: event.clientX - this.rect.left + window.pageXOffset,
        y: event.clientY - this.rect.top + window.pageYOffset
      }
    },
    updateCurrentMouse (event) {
      this.current = this.scaleCoords(event)
    },
    onResize () {
      try {
        this.$refs.whiteboard.width = this.$refs.whiteboard.parentElement.clientWidth
      } catch (e) {}
    },
    drawLine (x0, y0, x1, y1, emit = true) {
      this.context.beginPath()
      this.context.moveTo(x0, y0)
      this.context.lineTo(x1, y1)
      this.context.strokeStyle = 'black'
      this.context.lineWidth = 3
      this.context.stroke()
      this.context.closePath()
      if (emit) {
        this.$socket.client.emit('assessment whiteboard draw', this.assessment._id, {
          x0: x0 / this.$refs.whiteboard.width,
          y0: y0 / this.$refs.whiteboard.height,
          x1: x1 / this.$refs.whiteboard.width,
          y1: y1 / this.$refs.whiteboard.height
        })
      }
    },
    onMouseDown (event) {
      this.drawing = !this.drawing
      this.updateCurrentMouse(event)
    },
    onMouseUp (event) {
      const scaled = this.scaleCoords(event)
      if (this.drawing) { this.drawLine(this.current.x, this.current.y, scaled.x, scaled.y) }

      this.drawing = false
      this.updateCurrentMouse(event)
    },
    onMouseOut (event) {
      const scaled = this.scaleCoords(event)
      if (this.drawing) { this.drawLine(this.current.x, this.current.y, scaled.x, scaled.y) }

      this.updateCurrentMouse(event)
    },
    onMouseMove (event) {
      const now = new Date().getTime()
      if (!this.lastMouseUpdated || (now - this.lastMouseUpdated) > 10) {
        const scaled = this.scaleCoords(event)
        if (this.drawing) { this.drawLine(this.current.x, this.current.y, scaled.x, scaled.y) }
        this.updateCurrentMouse(event)

        this.lastMouseUpdated = now
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#whiteboard {
  border: 2px dotted black;
}
</style>
