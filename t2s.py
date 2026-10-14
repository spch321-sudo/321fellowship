import ctypes
_icu=ctypes.CDLL('libicui18n.so.74'); _uc=ctypes.CDLL('libicuuc.so.74')
V='_74'
openU=getattr(_icu,'utrans_openU'+V); openU.restype=ctypes.c_void_p
openU.argtypes=[ctypes.c_wchar_p,ctypes.c_int32,ctypes.c_int,ctypes.c_wchar_p,ctypes.c_int32,ctypes.c_void_p,ctypes.POINTER(ctypes.c_int)]
transU=getattr(_icu,'utrans_transUChars'+V)
transU.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.POINTER(ctypes.c_int32),ctypes.c_int32,ctypes.c_int32,ctypes.POINTER(ctypes.c_int32),ctypes.POINTER(ctypes.c_int)]
def _u16(s): return s.encode('utf-16-le')
_err=ctypes.c_int(0)
_idb=_u16('Traditional-Simplified')
_id=ctypes.create_string_buffer(_idb+b'\0\0')
openU.argtypes=[ctypes.c_void_p,ctypes.c_int32,ctypes.c_int,ctypes.c_void_p,ctypes.c_int32,ctypes.c_void_p,ctypes.POINTER(ctypes.c_int)]
_T=openU(ctypes.cast(_id,ctypes.c_void_p),len(_idb)//2,0,None,0,None,ctypes.byref(_err))
assert _err.value<=0,_err.value
def t2s(s):
    if not s: return s
    b=_u16(s); n=len(b)//2; cap=n*2+16
    buf=ctypes.create_string_buffer(b+b'\0'*(cap*2-len(b)))
    ln=ctypes.c_int32(n); lim=ctypes.c_int32(n); e=ctypes.c_int(0)
    transU(_T,buf,ctypes.byref(ln),cap,0,ctypes.byref(lim),ctypes.byref(e))
    assert e.value<=0,e.value
    return buf.raw[:ln.value*2].decode('utf-16-le')
if __name__=='__main__':
    print(t2s('國度321空中團契 讀經樂 畫線 默想 錄製 繁體 著 裡面 後來'))
