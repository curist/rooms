import { Config as DiffCfg, DiffPatcher } from 'jsondiffpatch'

const conf: DiffCfg = {
  objectHash: function(obj) {
    return obj._id || obj.id || obj.name
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
  textDiff: {
    minLength: 60,
  },
  cloneDiffValues: false,
}
const { diff } = new DiffPatcher(conf)

export { diff }
export default diff
