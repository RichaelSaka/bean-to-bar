<script lang="ts">
  let {
    shelfW,
    shelfHasShadow = true,
    wallH,
    rows
  }: {
    shelfW: number;
    shelfHasShadow?: boolean;
    wallH: number;
    rows: number;
  } = $props();

  const shelfHeight = Math.floor(wallH / rows);
</script>

<div class="shelf" style={`width:${shelfW}px; height:${shelfHeight}px;`}>
  <div class="shelf-front"></div>
  <div class="shelf-top"></div>
  <div class="shelf-right"></div>
  {#if shelfHasShadow}
    <div class="shelf-shadow"></div>
  {/if}
</div>

<style>
  .shelf {
    display: flex;
    align-items: flex-end;
    position: relative;
    pointer-events: none;
    margin: 0;
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
  }

  .shelf-front {
    background: #8b5a2b;
    width: 100%;
    height: 1rem;
    position: absolute;
    bottom: -1.5rem;
    z-index: 2;
    box-shadow: 0 19px 38px rgba(0, 0, 0, 0.1), 0 15px 12px rgba(0, 0, 0, 0.05);
  }

  .shelf-top {
    background: #a67c52;
    width: 100%;
    height: 1rem;
    position: absolute;
    left: 0.25rem;
    bottom: -0.5rem;
    transform: skew(-30deg);
    z-index: 2;
    clip-path: polygon(
      0 0,
      calc(100% - 1rem) 0,
      100% 100%,
      calc(100% - 1rem) 100%,
      0 100%,
      0 0
    );
  }

  .shelf-right {
    background: #704214;
  }

.shelf-shadow {
  position: absolute;
  bottom: -2.2rem;         /* pulls the shadow below the shelf */
  left: 0;
  width: 100%;
  height: 1.6rem;

  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.22) 0%,
    rgba(0, 0, 0, 0.18) 40%,
    rgba(0, 0, 0, 0.12) 70%,
    rgba(0, 0, 0, 0) 100%
  );

  filter: blur(6px);
  z-index: 0;
  pointer-events: none;
}

</style>
